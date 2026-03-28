import { GetStaticProps } from 'next';
import Head from 'next/head';
import NotionService, { NotionPost } from 'services/notion/notionApi';
import PostItemList from 'components/blocks/postItemList/PostItemList';
import Layout from 'components/templates/layout/Layout';
import Introduction from 'components/blocks/introduction/Introduction';
import Search from 'components/features/filter/search/Search';
import Category from 'components/features/filter/category/Category';
import NotionCategory from 'util/category/notionCategory/notionCategory';
import useFilterPost from 'components/features/filter/hooks/useFilterPost';

interface HomepageProps {
  notionList: NotionPost[];
}

const HomePage = ({ notionList }: HomepageProps) => {
  const { filteredNotionList, searchValue, currentActiveCategory, handleSearchValue, handleCurrentActiveCategory } =
    useFilterPost({ notionList });

  return (
    <>
      <Head>
        <title>Frontend Developer - Hooney Blog</title>
        <meta name="description" content="Welcome Hooneylog" />
        <meta property="og:title" content="Frontend Developer - Hooneylog" />
        <meta property="og:description" content="Welcome Hooneylog" />
        <meta property="og:url" content="https://www.hooneylog.com" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index,follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout>
        <div>
          <Introduction />
          <Search searchValue={searchValue} handleSearchValue={handleSearchValue} />
          <Category
            categories={new NotionCategory(notionList).orderedListByDescendingCount}
            handleCurrentActiveCategory={handleCurrentActiveCategory}
            currentActiveCategory={currentActiveCategory}
          />
          <PostItemList notionList={filteredNotionList} />
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const notionList = await new NotionService().getAllPost();
  return {
    props: {
      notionList,
    },
    revalidate: 1,
  };
};

export default HomePage;
